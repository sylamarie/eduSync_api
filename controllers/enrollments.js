const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Validation function for enrollment data (updated to 7 fields)
const validateEnrollment = (data) => {
    const requiredFields = ['studentId', 'courseId', 'enrollmentDate', 'status', 'finalGrade', 'semester', 'creditsEarned'];
    for (const field of requiredFields) {
        if (!data[field] && data[field] !== 0) { // Allow 0 for creditsEarned
            return { valid: false, message: `Field '${field}' is required.` };
        }
    }
    if (!ObjectId.isValid(data.studentId)) {
        return { valid: false, message: 'Invalid studentId format.' };
    }
    if (!ObjectId.isValid(data.courseId)) {
        return { valid: false, message: 'Invalid courseId format.' };
    }
    if (typeof data.creditsEarned !== 'number') {
        return { valid: false, message: 'Field \'creditsEarned\' must be a number.' };
    }
    return { valid: true };
};

const getAllEnrollments = async (req, res) => {
    // #swagger.tags = ['Enrollments']
    // #swagger.summary = 'Get all enrollments'
    // #swagger.description = 'Retrieves a list of all student enrollments from the database.'
    try {
        const result = await mongodb.getDatabase().db('edusync_api').collection('enrollments').find();
        const enrollments = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(enrollments);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching enrollments.' });
    }
};

const getEnrollmentById = async (req, res) => {
    // #swagger.tags = ['Enrollments']
    // #swagger.summary = 'Get a single enrollment by ID'
    // #swagger.description = 'Retrieves a single enrollment based on its unique MongoDB document ID.'
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid enrollment ID format.' });
    }
    const enrollmentId = new ObjectId(req.params.id);
    try {
        const result = await mongodb.getDatabase().db('edusync_api').collection('enrollments').findOne({ _id: enrollmentId });
        if (result) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(result);
        } else {
            res.status(404).json({ message: 'Enrollment not found.' });
        }
    } catch (error) {
        console.error('Error fetching enrollment by ID:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

const createEnrollment = async (req, res) => {
    // #swagger.tags = ['Enrollments']
    // #swagger.summary = 'Create a new enrollment'
    // #swagger.description = 'Adds a new enrollment to the database, linking a student to a course.'
    const validation = validateEnrollment(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const enrollment = {
        studentId: new ObjectId(req.body.studentId),
        courseId: new ObjectId(req.body.courseId),
        enrollmentDate: req.body.enrollmentDate, // e.g., "2024-08-15T00:00:00.000Z"
        status: req.body.status, // e.g., "Enrolled", "Completed", "Withdrawn"
        finalGrade: req.body.finalGrade, // e.g., "A", "B+", "In Progress"
        semester: req.body.semester, // e.g., "Fall 2024"
        creditsEarned: req.body.creditsEarned // e.g., 3
    };

    try {
        const response = await mongodb.getDatabase().db('edusync_api').collection('enrollments').insertOne(enrollment);
        if (response.acknowledged) {
            res.status(201).json({ message: 'Enrollment created successfully.', enrollmentId: response.insertedId });
        } else {
            res.status(500).json({ error: 'An error occurred while creating the enrollment.' });
        }
    } catch (error) {
        console.error('Error creating enrollment:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

const updateEnrollment = async (req, res) => {
    // #swagger.tags = ['Enrollments']
    // #swagger.summary = 'Update an existing enrollment'
    // #swagger.description = 'Updates the information for an existing enrollment by its document ID.'
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid enrollment ID format.' });
    }
    const enrollmentId = new ObjectId(req.params.id);
    
    const validation = validateEnrollment(req.body);
    if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
    }

    const updatedEnrollment = {
        studentId: new ObjectId(req.body.studentId),
        courseId: new ObjectId(req.body.courseId),
        enrollmentDate: req.body.enrollmentDate,
        status: req.body.status,
        finalGrade: req.body.finalGrade,
        semester: req.body.semester,
        creditsEarned: req.body.creditsEarned
    };

    try {
        const response = await mongodb.getDatabase().db('edusync_api').collection('enrollments').replaceOne({ _id: enrollmentId }, updatedEnrollment);
        if (response.modifiedCount > 0) {
            res.status(200).json({ message: 'Enrollment updated successfully.' });
        } else {
            res.status(404).json({ message: 'Enrollment not found or data is unchanged.' });
        }
    } catch (error) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

const deleteEnrollment = async (req, res) => {
    // #swagger.tags = ['Enrollments']
    // #swagger.summary = 'Delete an enrollment'
    // #swagger.description = 'Deletes an enrollment from the database by its document ID.'
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid enrollment ID format.' });
    }
    const enrollmentId = new ObjectId(req.params.id);

    try {
        const response = await mongodb.getDatabase().db('edusync_api').collection('enrollments').deleteOne({ _id: enrollmentId });
        if (response.deletedCount > 0) {
            res.status(200).json({ message: 'Enrollment deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Enrollment not found.' });
        }
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
};
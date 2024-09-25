const { Sequelize, DataTypes } = require("sequelize");
const dbConnection = require("../database/db");
const Klass = require("./klass");
const Category = require("./category");

const Student = dbConnection.define('student', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true
    },
    joindedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fatherName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fatherWork: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fatherEducation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    motherName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    motherEducation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sisters: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    brothers: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    beginFromPage: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    previousInstitute: {
        type: DataTypes.STRING,
        allowNull: true
    },
    previousAchievement: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    fatherPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    landlineNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    specialHealth: {
        type: DataTypes.STRING,
        allowNull: true
    },
    skill: {
        type: DataTypes.STRING,
        allowNull: true
    },
    school: {
        type: DataTypes.STRING,
        allowNull: true
    },
    schoolCohort: {
        type: DataTypes.STRING,
        allowNull: true
    },
    currentAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    klassId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: Klass,
            key: 'id'
        }
    },
    categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: Category,
            key: 'id'
        }
    },

},{
    timestamps: true,
    freezeTableName: true,
    paranoid: true
});

module.exports = Student;
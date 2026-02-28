'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TaskException', {
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
      },
      seriesId: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
              model: 'TaskSeries',
              key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
      },
      date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
      },
      overriddenDate: {
          type: Sequelize.DATEONLY
      },
      done: {
          type: Sequelize.BOOLEAN
      },
      order: {
          type: Sequelize.INTEGER
      },
      name: {
          type: Sequelize.STRING
      },
      deleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
      },
      userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE, 
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE, 
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('TaskException', ['seriesId', 'date'], {
      unique: true,
    });

    await queryInterface.addIndex('TaskException', ['userId', 'date']);
    await queryInterface.addIndex('TaskException', ['seriesId', 'overriddenDate']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('TaskException', ['seriesId', 'date']);

    await queryInterface.removeIndex('TaskException', ['userId', 'date']);
    await queryInterface.removeIndex('TaskException', ['seriesId', 'overriddenDate']);

    await queryInterface.dropTable('TaskException');
  }
};

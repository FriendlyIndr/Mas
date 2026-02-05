'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TaskSeries', {
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      rrule: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      startDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
      },
      endDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
      },
      userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
      },
    });

    await queryInterface.addIndex('TaskSeries', ['userId', 'startDate']);
    await queryInterface.addIndex('TaskSeries', ['userId', 'endDate']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('TaskSeries', ['userId', 'startDate']);
    await queryInterface.removeIndex('TaskSeries', ['userId', 'endDate']);

    await queryInterface.dropTable('TaskSeries');
  }
};

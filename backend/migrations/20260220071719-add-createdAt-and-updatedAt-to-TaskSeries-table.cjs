'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('TaskSeries', 'createdAt', {
      type: Sequelize.DATE, 
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    await queryInterface.addColumn('TaskSeries', 'updatedAt', {
      type: Sequelize.DATE, 
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('TaskSeries', 'createdAt');
    await queryInterface.removeColumn('TaskSeries', 'updatedAt');
  }
};

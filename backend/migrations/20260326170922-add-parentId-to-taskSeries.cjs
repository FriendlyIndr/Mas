'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('TaskSeries', 'parentId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'TaskSeries',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('TaskSeries', ['parentId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('TaskSeries', ['parentId']);

    await queryInterface.removeColumn('TaskSeries', 'parentId');
  }
};

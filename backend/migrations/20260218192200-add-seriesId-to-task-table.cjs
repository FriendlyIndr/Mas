'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Tasks', 'seriesId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'TaskSeries',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('Tasks', ['userId', 'seriesId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Tasks', ['userId', 'seriesId']);

    await queryInterface.removeColumn('Tasks', 'seriesId');
  }
};

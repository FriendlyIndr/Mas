'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
          allowNull: false,
      },
      name: {
          type: Sequelize.STRING,
          allowNull: false,
      },
      done: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
      },
      date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
      },
      order: {
          type: Sequelize.INTEGER,
          allowNull:true,
      },
      userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('Tasks', ['userId', 'date']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Tasks', ['userId', 'date']);
    await queryInterface.dropTable('Tasks');
  }
};

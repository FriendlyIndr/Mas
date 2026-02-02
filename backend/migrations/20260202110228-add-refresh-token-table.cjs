'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
      },
      userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id',
          },
          onDelete: 'CASCADE',
      },
      tokenHash: {
          type: Sequelize.TEXT,
          allowNull: false,
      },
      expiresAt: {
          type: Sequelize.DATE,
          allowNull: false,
      },
      createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      revokedAt: {
          type: Sequelize.DATE,
          allowNull: true,
      }
    });

    await queryInterface.addIndex('RefreshTokens', ['tokenHash'], {
        unique: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('RefreshTokens', ['tokenHash']);
    await queryInterface.dropTable('RefreshTokens');
  }
};

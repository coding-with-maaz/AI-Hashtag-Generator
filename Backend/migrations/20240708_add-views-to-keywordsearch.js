"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("keyword_searches", "views", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Anonymous view count for this keyword search"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("keyword_searches", "views");
  }
}; 
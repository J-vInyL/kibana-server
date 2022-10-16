import Sequelize from "sequelize";

export default class metric_status extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        service_id: Sequelize.INTEGER,
        service_desc: Sequelize.STRING,
        service_status: Sequelize.BOOLEAN,
        metric_post_count: Sequelize.INTEGER,
      },
      {
        sequelize,
        modelName: "Metric_Status",
        tableName: "metric_statuses",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
}

const { StatusCodes } = require('http-status-codes');
const { LoggerConfig } = require('../config/');
const { ErrorHandler } = require('../errors');

class CrudRepository {
  constructor(model) {
    this.model = model;
  }
  async create(data) {
    try {
      const response = await this.model.create(data);
      LoggerConfig.info(
        `Successfully added data to the Database --> repository layer`
      );
      return response;
    } catch (error) {
      console.log('error occured while creating data to database');
      LoggerConfig.error(
        `error occured while creating data to database ERROR:${error}`
      );
      throw error;
    }
  }
  async destroy(modelId) {
    try {
      const response = await this.model.destroy({
        where: {
          id: modelId,
        },
      });
      if (!response) {
        LoggerConfig.error(`Not able to delete the data with id ${modelId}`);
        throw new ErrorHandler(
          `Not able to delete the data with id ${modelId}`,
          StatusCodes.BAD_REQUEST
        );
      } else {
        LoggerConfig.info(`Successfully deleted the data with id ${modelId}`);
        return response;
      }
    } catch (error) {
      LoggerConfig.error(
        `Error occured while deleting the data with id ${modelId} ERROR:${error}`
      );
    }
  }
  async get(modelId) {
    try {
      const data = await this.model.findByPk(modelId);
      if (!data) {
        LoggerConfig.error(`Not able to find the data with id ${modelId}`);
        throw new ErrorHandler(
          `Not able to find the data with id ${modelId}`,
          StatusCodes.BAD_REQUEST
        );
      }
      LoggerConfig.info(`Successfully fetched the data with id ${modelId}`);
      return data;
    } catch (error) {
      LoggerConfig.error(
        `Error occured while fetching the data with id ${modelId} ERROR:${error}`
      );
      throw new ErrorHandler(
        `Error occured while fetching the data with id ${modelId} ERROR:${error}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async update(modelId, data) {
    try {
      const [updatedCount] = await this.model.update(data, {
        where: {
          id: modelId,
        },
      });
      if (!updatedCount) {
        LoggerConfig.error(`Not able to update the data with id ${modelId}`);
        throw new ErrorHandler(
          `Not able to update the data with id ${modelId}`,
          StatusCodes.BAD_REQUEST
        );
      }
      LoggerConfig.info(`Successfully updated the data with id ${modelId}`);
      return this.get(modelId);
    } catch (error) {
      LoggerConfig.error(
        `Error occured while updating the data with id ${modelId} ERROR:${error}`
      );
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(
        `Error occured while updating the data with id ${modelId} ERROR:${error}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAll() {
    try {
      const response = await this.model.findAll();
      LoggerConfig.info(`Successfully fetched all the data`);
      return response;
    } catch (error) {
      LoggerConfig.error(
        `Error occured while fetching all the data ERROR:${error}`
      );
      throw new ErrorHandler(
        `Error occured while fetching all the data ERROR:${error}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = { CrudRepository };

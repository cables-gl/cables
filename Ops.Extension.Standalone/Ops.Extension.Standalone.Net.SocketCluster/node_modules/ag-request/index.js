const scErrors = require('sc-errors');
const InvalidActionError = scErrors.InvalidActionError;

function AGRequest(socket, id, procedureName, data) {
  this.socket = socket;
  this.id = id;
  this.procedure = procedureName;
  this.data = data;
  this.sent = false;

  this._respond = (responseData, options) => {
    if (this.sent) {
      throw new InvalidActionError(`Response to request ${this.id} has already been sent`);
    }
    this.sent = true;
    this.socket.sendObject(responseData, options);
  };

  this.end = (data, options) => {
    let responseData = {
      rid: this.id
    };
    if (data !== undefined) {
      responseData.data = data;
    }
    this._respond(responseData, options);
  };

  this.error = (error, options) => {
    let responseData = {
      rid: this.id,
      error: scErrors.dehydrateError(error)
    };
    this._respond(responseData, options);
  };
}

module.exports = AGRequest;

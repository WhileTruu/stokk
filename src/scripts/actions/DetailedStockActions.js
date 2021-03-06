import alt from '../altInstance';
import {getStockById} from '../services/apiService';
import createGenericErrorHandler from '../services/genericErrorHandlerFactory';

@alt.createActions
class DetailedStockActions {
  getStock(id) {
    this.dispatch();
    const {getStockSuccess, getStockError} = this.actions;

    getStockById(id)
      .then(response => getStockSuccess(response.data.stock))
      .catch(createGenericErrorHandler(getStockError));
  }

  getStockSuccess(stock) {
    this.dispatch(stock);
  }

  getStockError(error) {
    this.dispatch(error);
  }

  adjustDaysShown(days) {
    this.dispatch(days);
  }

  checkboxClick(checkbox) {
    this.dispatch(checkbox);
  }
}

export default DetailedStockActions;

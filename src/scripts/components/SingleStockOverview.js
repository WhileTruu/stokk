import React from 'react';
import moment from 'moment';
import DetailedStockChart from './DetailedStockChart';

const SingleStockOverview = ({stock, daysShown}) => {
  console.log(daysShown);
  const {change, name, currentPrice, symbol, updatedAt, isPositiveChange} = stock;
  const isPositive = change.charAt(0) === '+';
  const updatedAgo = moment(updatedAt).fromNow();
  const positiveChangeResult = isPositiveChange ? 'Stock is going up' : 'Stock is going down';
  return (
    <div className="row">
      <div className="col-xs-12">
        <div className="dashboard__section">
          <h4 className="dashboard__heading">
            {symbol} - {name}
          </h4>
          <span className="base-text">
            {currentPrice} $
          </span>
          <span className={`change-label --${isPositive ? 'increase' : 'decrease'}`}>
            {change}
          </span>
          <span className="base-text">
            {' '} last updated {updatedAgo}
          </span>
          <span className={`direction-label --${isPositiveChange ? 'increase' : 'decrease'}`}>
            <i className={isPositiveChange ? 'fa fa-arrow-circle-up' : 'fa fa-arrow-circle-down'}></i>
            {positiveChangeResult}
          </span>
        </div>
        <div className="col-xs-12 col-xs-offset-0">
          <DetailedStockChart dataset={stock} daysShown={daysShown} typeLine />
        </div>
      </div>
    </div>
  );
};

SingleStockOverview.displayName = 'SingleStockOverview';

export default SingleStockOverview;

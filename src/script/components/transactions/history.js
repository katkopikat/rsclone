import moment from 'moment';
import app from '../../app';
import createElement from '../../utils/create';
import translatePage from '../settings/language';

const sortByDays = (list) => {
  const newList = [];

  for (let i = 0; i < list.length; i += 1) {
    if (!newList.length) {
      newList.push([list[i]]);
    } else {
      let isElPushed = false;
      newList.forEach((item) => {
        if (item[0].date === list[i].date) {
          item.push(list[i]);
          isElPushed = true;
        }
      });
      if (!isElPushed) {
        newList.push([list[i]]);
      }
    }
  }
  return newList;
};

export default async function renderHistory() {
  const transactions = await app.getTransactions();

  if (transactions) {
    const historyDiv = document.querySelector('.transactions-history');

    historyDiv.innerHTML = '';

    if (transactions.length > 0) {
      const lastTransactions = transactions.slice(0, 9);
      const sortedByDays = sortByDays(lastTransactions);

      sortedByDays.reverse().forEach((day) => {
        const dateDiv = createElement('div');
        const dayDiv = createElement('div', 'day');

        const date = new Date(day[0].date);

        let dayOfWeek;

        if (moment(new Date()).isSame(date, 'day')) {
          dayOfWeek = 'today';
        } else if (moment().subtract(1, 'days').isSame(date, 'day')) {
          dayOfWeek = 'yesterday';
        } else {
          dayOfWeek = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date);
        }

        dateDiv.insertAdjacentHTML(
          'afterbegin',
          `
          <span class="day-of-week" data-i18n="${dayOfWeek}"></span>
          <span class="date"> ${date.getDate()} </span>
          <span class="date" data-i18n="${date.getMonth()}"></span>
        `,
        );

        day.forEach((transaction) => {
          dayDiv.insertAdjacentHTML(
            'beforeend',
            `
          <div class="row">
          <div class="col">
            <p class="account-name" data-i18n="${transaction.account}">${transaction.account}</p>
            <p class="category-name" data-i18n="${transaction.category}">${transaction.category}</p>
          </div>
          <div class="col">
            <p class="money-amount ${transaction.type}">
              ${transaction.type === 'expenses' ? '-' : '+'}${transaction.amount}
              <span class="history_currency">${app.user.currency}</span>
            </p>
            <p class="description">${transaction.description}</p>
          </div>
        </div>
          `,
          );
        });

        const container = createElement('div', '', [dateDiv, dayDiv]);
        historyDiv.prepend(container);
      });
    } else if (transactions.length === 0) {
      const today = new Date();

      const dateDiv = createElement(
        'div',
        '',
        `<span class="day-of-week" data-i18n="today"></span>
        <span class="date"> ${today.getDate()} </span>
        <span class="date" data-i18n="${today.getMonth()}"></span>`,
      );
      const noTransactionMsg = createElement(
        'div',
        'no-transactions-msg',
        "Oops, it looks like you don't have any transactions yet.",
        ['i18n', 'no-trx-msg'],
      );

      historyDiv.append(dateDiv, noTransactionMsg);
    }

    translatePage();
  }
}

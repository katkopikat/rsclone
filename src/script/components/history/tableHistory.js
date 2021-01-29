/* eslint-disable no-use-before-define */
import createElement from '../../utils/create';
import app from '../../app';
import api from '../../api';
import translatePage from '../settings/language';

let typeTransaction = 'all';
let history;

function preloader() {
  const preloaderEl = document.getElementById('preloader');
  preloaderEl.classList.toggle('visible');
}

function historyHtml() {
  const main = document.querySelector('main');
  const row = createElement('div', 'row table-wrapper');
  const mainContainer = createElement('div', 'container-xxl transactions-container', row);
  const table = createElement('div', 'table-mask');

  main.append(mainContainer);
  row.append(table);
}

function formatDate(date) {
  let dd = date.getDate();
  if (dd < 10) dd = `0${dd}`;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = `0${mm}`;

  let yy = date.getFullYear() % 100;
  if (yy < 10) yy = `0${yy}`;

  return `${dd}.${mm}.${yy}`;
}

async function getHistory() {
  const transactions = await app.api.getTransactions();
  history = [...transactions];
}

function filterTransaction() {
  const historyByDate = history.sort((a, b) => b.date - a.date);
  if (typeTransaction === 'all') return historyByDate;
  return historyByDate.filter((transaction) => transaction.type === typeTransaction);
}

function tableCreate() {
  const filtredHistory = filterTransaction();
  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `<thead>
      <tr>
        <th scope="col" data-i18n="Date">Date</th>
        <th scope="col" data-i18n="Category">Category</th>
        <th scope="col" data-i18n="Amount">Amount</th>
        <th scope="col" data-i18n="Account">Account</th>
        <th scope="col" data-i18n="Description">Description</th>
        <th scope="col" data-i18n="Delete">Delete</th>
      </tr>
    </thead>`;
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  filtredHistory.forEach((transaction, i) => {
    const row = tbody.insertRow(i);
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();
    const cell4 = row.insertCell();
    const cell5 = row.insertCell();
    const cell6 = row.insertCell();

    const { type, date, category, amount, account, description, id } = transaction;

    cell1.className = 'cell__date';
    cell2.className = type === 'expenses' ? 'cell__category-expense' : 'cell__category-income';
    cell3.className = 'cell__amount';
    cell4.className = 'cell__account';
    cell5.className = 'cell__description';
    cell6.className = 'cell__delete';

    cell1.innerHTML = formatDate(new Date(date));
    cell2.innerHTML = category;
    cell3.innerHTML = amount;
    cell4.innerHTML = account;
    cell5.innerHTML = description;
    cell6.innerHTML = 'delete';

    cell2.dataset.i18n = category;
    cell4.dataset.i18n = account;
    cell6.dataset.i18n = 'Delete';
    cell6.dataset.id = id;
  });

  document.querySelector('.table-mask').append(table);
}

async function deleteTransactionCallback(el) {
  if ((el).classList.contains('cell__delete')) {
    const idDelete = el.getAttribute('data-id');
    // eslint-disable-next-line no-use-before-define
    api.deleteTransaction(idDelete).then(() => {
      rerenderTable();
    });
  }
}

function deleteTransaction() {
  document.querySelector('.table').addEventListener('click', (e) => {
    e.preventDefault();
    deleteTransactionCallback(e.target);
  });
}

function renderTableBtns() {
  const tableTypeBtns = createElement(
    'div',
    'btn-group btn-group-toggle type-table',
    null,
    ['toggle', 'buttons'],
  );
  tableTypeBtns.insertAdjacentHTML(
    'beforeend',
    `
    <label class="btn btn-secondary">
    <input type="radio" name="type-table" id="all" autocomplete="on"> All
    </label>
    <label class="btn btn-secondary active">
    <input type="radio" name="type-table" id="expenses" autocomplete="off" checked> Expenses
    </label>
    <label class="btn btn-secondary">
    <input type="radio" name="type-table" id="income" autocomplete="off"> Income
    </label>`,
  );
  document.querySelector('.table-wrapper').prepend(tableTypeBtns);
}

function rerenderTable() {
  preloader();
  getHistory().then(() => {
    document.querySelector('.table').remove();
    filterTransaction();
    tableCreate();
    deleteTransaction();
    preloader();
  });
}

function buttonsListeners() {
  document.querySelectorAll('[name="type-table"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.checked === true) {
        typeTransaction = btn.id;
        rerenderTable(typeTransaction);
      }
    });
  });
}

function createTableContent() {
  filterTransaction();
  tableCreate();
  renderTableBtns();
  buttonsListeners();
  deleteTransaction();
  translatePage();
}

export default function renderHistoryPage() {
  preloader();
  getHistory().then(() => {
    historyHtml();
    createTableContent();
    preloader();
  });
}
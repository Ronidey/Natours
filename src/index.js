import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const btnSavePassword = document.querySelector('.btn--save-password');
const checkoutBtn = document.getElementById('checkout-btn');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (userForm) {
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', e.target.name.value);
    form.append('email', e.target.email.value);
    form.append('photo', e.target.photo.files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    btnSavePassword.textContent = 'Updating...';

    const currentPassword = e.target.currentPassword.value;
    const password = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    await updateSettings(
      { currentPassword, password, confirmPassword },
      'password'
    );

    e.target.reset();
    btnSavePassword.textContent = 'Save Password';
  });
}

if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async (e) => {
    const btn = e.target;

    btn.textContent = 'Processing...';
    const { tourId } = btn.dataset;
    bookTour(tourId);
  });
}

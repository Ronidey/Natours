import axios from 'axios';
import { showAlert } from './alert';

let stripe = Stripe(
  'pk_test_51Hg4jdEkK4QaqjC2vRZ9N0ILIyZgG6wntlu4Ip0DiUBMkbz6yLb7LS4msqmKE1RnJxrGp7LMvSboUtauztHpNRyt00IyKMktkg'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from the server
    const res = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: res.data.session.id
    });
  } catch (err) {
    showAlert(err, err);
  }
};

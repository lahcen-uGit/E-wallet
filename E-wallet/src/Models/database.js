const database = {
  users: [
    {
      id: "1",
      name: "Ali",
      email: "Ali@example.com",
      password: "1232",
      wallet: {
        balance: 12457,
        currency: "MAD",
        cards: [
          { numcards: "124847", type: "visa",       balance: 14712, expiry: "14-08-27" },
          { numcards: "124478", type: "mastercard", balance: 1470,  expiry: "14-08-28" },
        ],
        transactions: [
          { id: "1", type: "credit", amount: 140, date: "14-08-25", from: "Ahmed", to: "124847" },
          { id: "2", type: "debit",  amount: 200, date: "13-08-25", from: "124847", to: "Amazon" },
          { id: "3", type: "credit", amount: 250, date: "12-08-25", from: "Ahmed", to: "124478" },
        ],
      },
    },
    {
      id: "2",
      name: "Ahmed",
      email: "Ahmed@example.com",
      password: "5678",
      wallet: {
        balance: 8000,
        currency: "MAD",
        cards: [
          { numcards: "987654", type: "visa", balance: 5000, expiry: "20-12-26" },
        ],
        transactions: [],
      },
    },
    {
      id: "3",
      name: "Sara",
      email: "Sara@example.com",
      password: "4321",
      wallet: {
        balance: 3500,
        currency: "MAD",
        cards: [
          { numcards: "111222", type: "mastercard", balance: 3500, expiry: "10-05-27" },
        ],
        transactions: [],
      },
    },
  ],
};

// trouver user par email et password
const finduserbymail = (mail, password) => {
  return database.users.find((u) => u.email === mail && u.password === password);
};

// retourner tous les users sauf le user connecte
const getBeneficiaires = (currentUserId) => {
  return database.users.filter((u) => u.id !== currentUserId);
};

export { finduserbymail, getBeneficiaires };
export default finduserbymail;
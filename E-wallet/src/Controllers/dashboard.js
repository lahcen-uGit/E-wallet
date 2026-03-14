import { finduserbymail, getBeneficiaires } from "../Models/database.js";



// Recuperer Dom
const user = JSON.parse(sessionStorage.getItem("Currentuser"));
const greetingName = document.getElementById("greetingName");
const availableBalance = document.getElementById("availableBalance");
const Revenue = document.getElementById("monthlyIncome");
const Depenses = document.getElementById("monthlyExpenses");
const activeCards = document.getElementById("activeCards");

const Trasnferbtn = document.getElementById("quickTransfer");
const transfSection = document.getElementById("transfer-section");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const transferForm = document.getElementById("transferForm");

const beneficiarySelect = document.getElementById("beneficiary");
const sourceCardSelect = document.getElementById("sourceCard");
const amountInput = document.getElementById("amount");

// nom afficher dans le message de bienvenue
greetingName.textContent = user.name;

// solde disponible
availableBalance.textContent = user.wallet.balance + " " + user.wallet.currency;

// filtrez les transactions de type "debit" et "credit" + calculer le total
const Dtrasnactions = user.wallet.transactions.filter((t) => t.type === "debit");
const Ctransactions = user.wallet.transactions.filter((t) => t.type === "credit");

const totalDep = Dtrasnactions.reduce((total, t) => total + t.amount, 0);
const totalRev = Ctransactions.reduce((total, t) => total + t.amount, 0);

Revenue.textContent = totalRev + " " + user.wallet.currency;
Depenses.textContent = totalDep + " " + user.wallet.currency;

// active cards
activeCards.textContent = user.wallet.cards.length;


// Remplir la liste des bénéficiaires

function populateBeneficiaires() {
    beneficiarySelect.innerHTML = '<option value="" disabled selected>Choisir un bénéficiaire</option>';
    const beneficiaires = getBeneficiaires(user.id);
    beneficiaires.forEach((b) => {
        const option = document.createElement("option");
        option.value = b.id;
        option.textContent = b.name + " (" + b.email + ")";
        beneficiarySelect.appendChild(option);
    });
}


// Remplir la liste des cartes de l'utilisateur

function populateCartes() {
    sourceCardSelect.innerHTML = '<option value="" disabled selected>Sélectionner une carte</option>';
    user.wallet.cards.forEach((card) => {
        const option = document.createElement("option");
        option.value = card.numcards;
        option.textContent =
            card.type+" - " +
            card.numcards+
            "  (Solde: " + card.balance + " " + user.wallet.currency + ")";
        sourceCardSelect.appendChild(option);
    });
}


// Ouvrir le formulaire de transfert

Trasnferbtn.addEventListener("click", function () {
    populateBeneficiaires();
    populateCartes();
    amountInput.value = "";
    transfSection.classList.remove("hidden");
});

// =============================================
// Fermer le formulaire button annuler et X

function closeTransfer() {
    transfSection.classList.add("hidden");
}

if (closeTransferBtn) closeTransferBtn.addEventListener("click", closeTransfer);
if (cancelTransferBtn) cancelTransferBtn.addEventListener("click", closeTransfer);









// Validation et soumission du transfert

transferForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const toUserId = beneficiarySelect.value;
    const fromCardNum = sourceCardSelect.value;
    const montant = parseFloat(amountInput.value);

    // Toute la validation est geree par les callbacks imbriques dans faireTransfert

    // Effectuer le transfert avec callbacks imbriques
    faireTransfert(
        user.id,
        fromCardNum,
        toUserId,
        montant,
        // onSuccess
        (result) => {
            alert(result.msg);
            // Mettre a jour l'affichage depuis sessionStorage
            const updatedUser = JSON.parse(sessionStorage.getItem("Currentuser"));
            availableBalance.textContent = updatedUser.wallet.balance + " " + updatedUser.wallet.currency;
            closeTransfer();
        },
        // onError
        (errMsg) => {
            alert(errMsg);
        }
    );
});

// faire le transfert avec callbacks imbriques
const faireTransfert = (fromUserId, fromCardNum, toUserId, montant, onSuccess, onError) => {

  const fromUser = database.users.find((u) => u.id === fromUserId);
  const toUser   = database.users.find((u) => u.id === toUserId);
  const card     = fromUser ? fromUser.wallet.cards.find((c) => c.numcards === fromCardNum) : null;

  // ── Etape 1 : check amount ──────────────────────────────────────────
  const checkAmount = (montant, next) => {
    if (isNaN(montant) || montant <= 0) {
      return onError("Le montant doit être un nombre supérieur à 0.");
    }
    next(montant);
  };

  // ── Etape 2 : check solde de la carte ──────────────────────────────
  const checkSolde = (montant, next) => {
    if (!card) {
      return onError("Carte source introuvable.");
    }
    if (montant > card.balance) {
      return onError(
        "Solde insuffisant sur cette carte. Solde disponible : " +
        card.balance + " MAD"
      );
    }
    next(montant);
  };

  // ── Etape 3 : check bénéficiaire ───────────────────────────────────
  const checkBeneficiaire = (montant, next) => {
    if (!toUser) {
      return onError("Bénéficiaire introuvable.");
    }
    if (toUser.id === fromUser.id) {
      return onError("Vous ne pouvez pas vous transférer à vous-même.");
    }
    next(montant);
  };

  // ── Etape 4 : création des deux transactions + mise a jour soldes ──
  const createTransactions = (montant) => {
    const date = new Date().toLocaleDateString("fr-FR");
    const newId = Date.now().toString();

    // transaction DEBIT chez le sender
    const txDebit = {
      id: newId + "_d",
      type: "debit",
      amount: montant,
      date: date,
      from: fromUser.wallet.cards.find((c) => c.numcards === fromCardNum).numcards,
      to: toUser.name,
    };

    // transaction CREDIT chez le bénéficiaire
    const txCredit = {
      id: newId + "_c",
      type: "credit",
      amount: montant,
      date: date,
      from: fromUser.name,
      to: toUser.id,
    };

    // Deduire du sender (carte + wallet)
    card.balance          -= montant;
    fromUser.wallet.balance -= montant;
    fromUser.wallet.transactions.push(txDebit);

    // Crediter le beneficiaire (wallet)
    toUser.wallet.balance += montant;
    toUser.wallet.transactions.push(txCredit);

    // Mettre a jour sessionStorage
    sessionStorage.setItem("Currentuser", JSON.stringify(fromUser));

    // ── Valide : retourner true via onSuccess ──
    onSuccess({
      ok: true,
      msg: "Transfert réussi vers " + toUser.name + " !",
      txDebit,
      txCredit,
    });
  };

  // ── Lancer la chaine de callbacks imbriques ──
  checkAmount(montant, (montant) =>
    checkSolde(montant, (montant) =>
      checkBeneficiaire(montant, (montant) =>
        createTransactions(montant)
      )
    )
  );
};
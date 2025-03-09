async function callBackend(reqBody, endpoint) {
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify(reqBody);

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return await fetch(`./server.php?action=${endpoint}`, requestOptions)
    .then((response) => response.json())
    .then((result) => result)
    .catch((error) => {
      console.log(error);
      return `ERROR: ${error}`;
    });
}

// update the transactions in the frontend and backend
async function updateTxns(hash, memo) {
  let txnCount = transactions.length;

  // changing in the frontend
  transactions[txnCount] = {
    explorer: chainExplorer,
    trx: Date.now(),
    txnHash: hash,
    memo,
  };

  // changing in the backend
  callBackend(
    {
      explorer: chainExplorer,
      wallet: changeAddress,
      txnHash: hash,
      timestamp: Date.now(),
      memo,
    },
    "updateHashes"
  );
}

async function updateBalance() {
  // delay for 8 seconds
  await new Promise((resolve) => setTimeout(resolve, 8000));

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  const balanceAtomic = await web3.eth.getBalance(accounts[0]);
  const balanceETN = web3.utils.fromWei(balanceAtomic, "ether");
  balanceDiv.innerHTML = `${Number(balanceETN).toFixed(5)} ETN`;

  showNotification("Balance updated");
}

async function purchaseCall(amount, memo, song = "", cardId = "") {
  document.querySelector(".modal h2").textContent = "Payment Workflow";
  positionModal();

  toggleClasses.forEach((el) => el.classList.toggle("hidden"));
  document.querySelector(".modal div").style.display = "none";
  paymentDetails.style.display = "block";
  closeModalBtn.style.display = "none";
  confirmation.style.display = "block";

  paymentMemo.textContent = memo;
  // paymentAmount.textContent = `${amount} ETN`;
  confirmation.style.display = "none";
  paymentFlow.style.display = "flex";
  timer.style.display = "block";

  const start = Date.now();
  const showElapsedTime = () => {
    timer.textContent = `${Math.floor(
      (Date.now() - start) / 1000
    )} seconds elapsed`;
  };
  const timerInterval = setInterval(showElapsedTime, 1000);

  step1.style.filter = "grayscale(0%)";
  step2.style.filter = "grayscale(0%)";
  document.querySelector(".modal h2").textContent = "Signing the transaction";

  try {
    const txnResult = await sendETN(memo, amount);
    console.log(txnResult);

    if (txnResult.success === false) {
      clearInterval(timerInterval);
      resetStyling();
      toggleClasses.forEach((el) => el.classList.toggle("hidden"));
      return;
    }

    updateBalance();

    step4.style.filter = "grayscale(0%)";
    document.querySelector(".modal h2").textContent = "Updating the record";

    updateTxns(txnResult.txn, memo);
  } catch (err) {
    clearInterval(timerInterval);
    resetStyling();
    toggleClasses.forEach((el) => el.classList.toggle("hidden"));
    return;
  }

  // song is null when we are just purchasing the hints
  if (song === "") {
    // highlight the correct card
    document.querySelector(`#${cardId}`).style.border = "5px solid pink";
  } else {
    purchasedSongs += song;
    attachEventListeners();

    // changing in the backend
    callBackend(
      {
        wallet: changeAddress,
        song: song,
      },
      "updateSongs"
    );
  }

  clearInterval(timerInterval);
  document.querySelector(".modal h2").textContent = "Transaction completed 😊";
  closeModalBtn.style.display = "block";
}

// paying the admin to buy some assets
async function sendETN(
  memo,
  amount,
  adminWallet = "0xe50058eaFB009bfa754e1020CD133E42db0fbc6c"
) {
  try {
    // get the current balance of the wallet address
    const balance = await getWalletBalance();

    // Check if the user has enough balance
    if (balance <= amount) {
      showNotification("Insufficient balance", "rgba(255, 0, 0, 0.6)");
      return {
        tx: null,
        success: false,
      };
    }

    const amountInEther = web3.utils.toWei(amount.toString(), "ether");

    // Estimate the gas limit dynamically
    const gasLimit = await web3.eth.estimateGas({
      to: adminWallet,
      value: amountInEther,
      data: web3.utils.toHex(memo),
      from: window.ethereum.selectedAddress,
    });

    // Get current gas price dynamically
    const gasPrice = await web3.eth.getGasPrice();

    // Step 1: Create the transaction object
    const transactionParameters = {
      to: adminWallet,
      value: amountInEther,
      data: web3.utils.toHex(memo),
      // Estimated gas limit
      gas: web3.utils.toHex(gasLimit),
      // Dynamic gas price
      gasPrice: web3.utils.toHex(gasPrice),
      from: window.ethereum.selectedAddress,
    };

    // Step 2: Send the transaction via MetaMask
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    console.log(txHash);

    return { txn: txHash, success: true };
  } catch (error) {
    // error = Confirmation declined by user (if user rejects the transaction)
    // error.message may contain something else its undefined
    console.error(error);
    showNotification(
      error?.message && error.message.split(":")[1]
        ? error.message
        : "Declined the transaction",
      "rgba(255, 0, 0, 0.6)"
    );

    if (useHintOnce != undefined) {
      useHintOnce = false;
      // disabling the help icon as it can be only used once in a level by the player
      helpBitbucket.style.pointerEvents = "auto";
    }

    return {
      tx: null,
      success: false,
    };
  }
}

// function to pay user
async function payUser(amount, message, toAddress = changeAddress) {
  document.querySelector("body").style.pointerEvents = "none";
  document.querySelector("#loader").style.display = "block";

  try {
    const response = await fetch(
      "https://etn-server-clashingvats-dev.apps.rm2.thpm.p1.openshiftapps.com/sendETN",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiver: toAddress,
          memo: message,
          amount,
        }),
      }
    );

    const res = await response.json();

    if (res.success) {
      updateTxns(res.success, message);

      document.body.click();
      coin.play();
      showNotification(`${amount} ETN(s) have been deposited!`);

      updateBalance();
    }
  } catch (error) {
    console.log(error);
    showNotification(
      "<a style='color: white; text-decoration: underline' href='https://tron-server-chamanrock-dev.apps.rm3.7wse.p1.openshiftapps.com/' target='_blank'>Ankr RPC URL</a> is not running<br>ETN rewards could not be provided",
      "rgba(255, 0, 0, 0.6)"
    );
  }

  document.querySelector("body").style.pointerEvents = "auto";
  document.querySelector("#loader").style.display = "none";
}

// Disconnect by revoking permissions
async function disconnect() {
  await window.ethereum.request({
    method: "wallet_revokePermissions",
    params: [{ eth_accounts: {} }],
  });
}

// get the balance of the connected wallet
async function getWalletBalance() {
  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  const balanceAtomic = await web3.eth.getBalance(accounts[0]);
  const balanceETN = web3.utils.fromWei(balanceAtomic, "ether");
  return Number(balanceETN).toFixed(5);
}

// web3 constructor
const web3 = new Web3(window.ethereum);

// get wallet details
async function getWalletDetails(web3wallet, chainId) {
  try {
    chainExplorer =
      chainId == "0x4f5e0c"
        ? "https://blockexplorer.thesecurityteam.rocks"
        : "https://blockexplorer.electroneum.com";

    document.querySelector("#gameBtn").style.visibility = "visible";
    document.querySelector("#walletDetails").textContent = web3wallet;

    // fetch & display balance
    const balanceAtomic = await web3.eth.getBalance(web3wallet);
    const balanceETN = Number(
      web3.utils.fromWei(balanceAtomic, "ether")
    ).toFixed(5);
    balanceDiv.textContent = `${balanceETN} ETN`;

    setupMetaMaskListeners();

    document.querySelector("#walletError").style.visibility = "hidden";

    document.querySelector("#gameBtn").style.visibility = "visible";
    document.querySelector(
      "#username"
    ).innerHTML = `👋 <span style="color: black">${web3wallet}</span>`;
    changeAddress = web3wallet;

    document.querySelector("#gameBtn").textContent = "Play Game";

    signupResult = await callBackend({ wallet: changeAddress }, "userDetails");

    videoLevels.textContent = signupResult.videoLevel;

    // setting up the variables for the game
    score = signupResult.score;
    streak = signupResult.streak;
    purchasedSongs = signupResult.songs;
    transactions = signupResult.txnHashes;

    const visited = signupResult.visited;

    if (streak == 1 && !visited) await payUser(0.000015, "Day 1 streak reward");
    else if (streak == 2 && !visited)
      await payUser(0.000017, "Day 2 streak reward");
    else if (streak >= 3 && !visited)
      await payUser(0.000019, "Day 3+ streak reward");

    document.querySelector("#overAllScore").innerHTML = signupResult.score;
    balanceDiv.textContent = `${balanceETN} ETN`;

    showNotification("Connected successfully 🥳");
  } catch (err) {
    console.log(err);
  }
}

// metamask connection function
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      // Request MetaMask account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      // allowing the ETN Mainnet chain only
      if (chainId !== "0xcb2e") {
        showNotification(
          "Use ETN Mainnet chain to proceed",
          "rgba(255, 0, 0, 0.6)"
        );

        return await disconnect();
      }

      // not allowing more than 1 account
      if (accounts.length > 1) {
        showNotification(
          "Select a single account only",
          "rgba(255, 0, 0, 0.6)"
        );

        return await disconnect();
      }

      document.querySelector("#walletError").style.visibility = "hidden";
      getWalletDetails(web3.utils.toChecksumAddress(accounts[0]), chainId);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      showNotification("Failed to connect to MetaMask", "rgba(255, 0, 0, 0.6)");
    }
  } else {
    document.querySelector("#gameBtn").style.visibility = "hidden";
    walletError.style.visibility = "visible";
    walletError.innerHTML = `Install <a style="text-decoration: underline; color: white" href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank">MetaMask</a> to play the game`;
  }
}

// Trying to look for already added wallets in the metamask extension
(async () => {
  let metaMaskHandled = false; // Flag to ensure handleMetaMask is called only once

  if (window.ethereum) {
    handleMetaMask();
  } else {
    window.addEventListener("ethereum#initialized", handleMetaMask, {
      once: true,
    });

    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have MetaMask installed.
    setTimeout(handleMetaMask, 3000);
  }

  async function handleMetaMask() {
    try {
      // Ensure it runs only once
      if (metaMaskHandled) return;
      metaMaskHandled = true;

      if (window.ethereum) {
        document.querySelector("#gameBtn").style.visibility = "visible";
        document.querySelector("#walletError").style.visibility = "hidden";

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!accounts.length) {
          document.querySelector("#walletError").style.visibility = "visible";
          return (document.querySelector("#walletError").innerHTML =
            "MetaMask is not connected, locked, or no accounts are available.<br>Unlock metamask & refresh the page");
        }

        const userAddress = web3.utils.toChecksumAddress(accounts[0]);
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        document.querySelector("#gameBtn").textContent = "Play Game";

        getWalletDetails(userAddress, chainId);
      } else {
        walletError.style.visibility = "visible";
        walletError.innerHTML = `Install <a style="text-decoration: underline; color: white" href="https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank">MetaMask</a> to play the game`;
      }
    } catch (err) {
      showNotification(
        err?.message ? err.message : "Some error occured",
        "rgba(255, 0, 0, 0.6)"
      );
    }
  }
})();

async function setupMetaMaskListeners() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      // when the metamask extension is locked
      if (!accounts.length) {
        showNotification(
          "Metamask locked or disconnected!!<br>Disconnecting you",
          "rgba(255, 0, 0, 0.6)"
        );
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (accounts.length == 1) {
        showNotification("Wallet connected");
      }
    });
  }
}

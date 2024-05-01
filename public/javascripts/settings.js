const openDeleteUserDialogBtn = document.querySelector('.delete-button');
const dyslexiaBtn = document.querySelector('.dyslexia-button');
const colorblindaBtn = document.querySelector('.colorblind-button');
const darkmodeBtn = document.querySelector('.darkmode-button');

const deleteUserDialog = document.querySelector('.delete-user-dialog');
const noDeleteUserDialogBtn = document.querySelector('.no-btn-delete');
const yesDeleteUserDialogBtn = document.querySelector('.yes-btn-delete');

/*
const API_ENDPOINTS = {
    deleteUser: "/api/deleteuser",
}


openDeleteUserDialogBtn.onclick = async () => {
    deleteUserDialog.showModal();

};
*/
noDeleteUserDialogBtn.onclick = async () => {
    deleteUserDialog.close();
};

yesDeleteUserDialogBtn.onclick = async () => {
    await deleteUser(username);
    deleteUserDialog.close();
};


async function deleteUser(username) {
    return fetchData("/api/test421231", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
    },
      body: JSON.stringify(username),
  });
}
  console.log(username);
  console.log(JSON.stringify(username));

async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      console.log(url);
      console.log(options);
      console.log("RESPONSE:", response);
      if (!response.ok) {
        throw new Error("Network response was not ok", response);
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch Data error:", error);
      throw error;
    }
}

let test = {
  username: username,
}
//deleteUser("martin");



//popup for buttons not implemented on the setting site
dyslexiaBtn.onclick = () => {
  alert("Not implemented. Coming soon!");
}

colorblindaBtn.onclick = () => {
  alert("Not implemented. Coming soon!");
}

darkmodeBtn.onclick = () => {
  alert("Not implemented. Coming soon!");
}

openDeleteUserDialogBtn.onclick = async () => {
    alert("Not implemented. Coming soon!");
}



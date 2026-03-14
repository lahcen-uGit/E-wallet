import finduserbymail from "../Models/database.js";
// Recuperer Dom 
const mailinput = document.getElementById("mail");
const passinput = document.getElementById("password");
const submitbtn = document.getElementById("submitbtn");

submitbtn.addEventListener("click", function traitement(){
    const mail = mailinput.value;
    const password = passinput.value;
    console.log("clicking");
    submitbtn.textContent = "Loading...";

    if(mail == "" || password == ""){

        alert("please take time to fill the form");
        submitbtn.textContent = "Se connecter";

    }else{
        // champs sont remplies , donc on chercher l'utilisateur par les champs mail et password
        const user = finduserbymail(mail, password);

        if(user){
            sessionStorage.setItem("Currentuser",JSON.stringify(user));
            submitbtn.textContent = "Logging In...";
            setTimeout(() => {
                document.location.href="dashboard.html";
            },1000);
        }else{
            alert("Bad credentials");
            submitbtn.textContent = "Se connecter";
        }   
    }

});
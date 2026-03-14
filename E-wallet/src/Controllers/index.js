// DOM recuperer 
const but=document.getElementById("Loginbtn");
but.addEventListener("click", function handler(){
    console.log("clicking");
    but.textContent = "Redirecting...";
    setTimeout(() => {
        document.location.href="login.html";
    },1000);
    
});
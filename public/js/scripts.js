if(location.pathname == "/signUp"){
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm-password");
        function containsSpecialChars(str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return specialChars.test(str);
          }
          function containsNumbers(str) {
            const specialChars = /[0-9]/;
            return specialChars.test(str);
          }
          function containsLowerChars(str) {
            const specialChars = /[a-z]/;
            return specialChars.test(str);
          }
          function containsUpperChars(str) {
            const specialChars = /[A-Z]/;
            return specialChars.test(str);
          }
          function containsNumbers(str) {
            const specialChars = /[0-9]/;
            return specialChars.test(str);
          }

        for(var item of [password,confirmPassword]){

             item.addEventListener("input", (event)=>{

                if(password.value != confirmPassword.value){
                    document.querySelector(".match").innerHTML = "Match passwords";
                    document.querySelector("#i-match").innerHTML = "clear";
                    document.querySelector("#i-match").classList.remove("gg-check");
                }else{
                    document.querySelector(".match").innerHTML = "Match passwords";
                    document.querySelector("#i-match").innerHTML = "";
                    document.querySelector("#i-match").classList.add("gg-check");
                }
                
                if(!containsSpecialChars(event.target.value)){
                    document.querySelector(".special").innerHTML = "Special Characters";
                    document.querySelector("#i-special").innerHTML = "clear";
                    document.querySelector("#i-special").classList.remove("gg-check");

                }else{
                    document.querySelector(".special").innerHTML = "Special Characters";
                    document.querySelector("#i-special").innerHTML = "";
                    document.querySelector("#i-special").classList.add("gg-check");
                }

                if(!containsNumbers(event.target.value)){
                    document.querySelector(".number").innerHTML = "Numbers";
                    document.querySelector("#i-number").innerHTML = "clear";
                    document.querySelector("#i-number").classList.remove("gg-check");

                }else{
                    document.querySelector(".number").innerHTML = "Numbers";
                    document.querySelector("#i-number").innerHTML = "";
                    document.querySelector("#i-number").classList.add("gg-check");
                }
                if(!containsLowerChars(event.target.value)){
                    document.querySelector(".lower").innerHTML = "Lowercase Characters";
                    document.querySelector("#i-lower").innerHTML = "clear";
                    document.querySelector("#i-lower").classList.remove("gg-check");

                }else{
                    document.querySelector(".lower").innerHTML = "Lowercase Characters";
                    document.querySelector("#i-lower").innerHTML = "";
                    document.querySelector("#i-lower").classList.add("gg-check");
                }
                if(!containsUpperChars(event.target.value)){
                    document.querySelector(".upper").innerHTML = "Uppercase Characters";
                    document.querySelector("#i-upper").innerHTML = "clear";
                    document.querySelector("#i-upper").classList.remove("gg-check");

                }else{
                    document.querySelector(".upper").innerHTML = "Uppercase Characters";
                    document.querySelector("#i-upper").innerHTML = "";
                    document.querySelector("#i-upper").classList.add("gg-check");
                }
                if(event.target.value.length < 6){
                    document.querySelector(".size").innerHTML = "At least 6 characters";
                    document.querySelector("#i-size").innerHTML = "clear";
                    document.querySelector("#i-size").classList.remove("gg-check");
                }else{
                    document.querySelector(".size").innerHTML = "At least 6 characters";
                    document.querySelector("#i-size").innerHTML = "";
                    document.querySelector("#i-size").classList.add("gg-check");
                }
            });
        }
        
}





const usersContainer = document.getElementById("usersContainer");
const spinner = document.getElementById("spinner");
const alertBox = document.getElementById("alertBox"); 
console.log("JavaScript is working");
async function getUsers(){
    try{
        const responce = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!responce.ok){
            throw new Error("Faild to fetch") 
        }

        
        const users= await responce.json()
        displayUsers(users);

    }
  catch(error){

    console.log("Error:" , error)
    alert(error.message);
    alertBox.textContent=error.message;
  alertBox.textContent=remove("d-none");

  
  }

  finally {
    spinner.classList.add("d-none");
  }
  
}

function displayUsers(users) {

    usersContainer.innerHTML = "";

    users.forEach(function(user) {

        const card = `
            <div class="col-md-6 col-lg-4">

                <div class="card h-100">

                    <div class="card-body">

                        <h5 class="card-title">
                            ${user.name}
                        </h5>

                        <p class="card-text">
                            Email: ${user.email}
                        </p>

                        <p class="card-text">
                            City: ${user.address.city}
                        </p>

                        <p class="card-text">
                            Company: ${user.company.name}
                        </p>

                    </div>

                </div>

            </div>
        `;

        usersContainer.innerHTML += card;

    });

}

getUsers();
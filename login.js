// =========================================
// CAMPUS SAATHI - LOGIN
// =========================================

const SUPABASE_URL = "https://sjnejzsvmedbjqpmoyhw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ANNCaMJFW9vxfFzpEzClxA_QUk-Q-8h";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) return;


    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        loginMessage.textContent =
            "Signing in...";

        loginMessage.style.color = "#6c63ff";


        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({

                    email: email,
                    password: password

                });


            if (error) {
                throw error;
            }


            // Get user's name from Supabase
            const user = data.user;

            const userName =
                user?.user_metadata?.full_name || "Student";


            // Save user's name
            localStorage.setItem(
                "userName",
                userName
            );


            loginMessage.textContent =
                "Login successful! Opening dashboard...";

            loginMessage.style.color = "#16a34a";


            // Open Dashboard
            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 800);


        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                error.message || "Login failed.";

            loginMessage.style.color = "#dc2626";

        }

    });

});
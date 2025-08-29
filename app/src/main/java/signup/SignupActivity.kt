package signup

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.view.View
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.broach.databinding.ActivitySignupBinding
import com.example.broach.ui.login.LoginActivity
import kotlinx.coroutines.launch
import network.RetrofitClient
import network.ApiService
import android.text.TextWatcher

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding
    private val viewModel: SignupViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(SignupViewModel::class.java)) {
                    val apiService = RetrofitClient.createService(ApiService::class.java)
                    val repository = SignupRepository(apiService)
                    @Suppress("UNCHECKED_CAST")
                    return SignupViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)


        binding.tilFullName.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                checkAllFields()
            }
        })

        binding.tilEmail.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                checkAllFields()
            }
        })

        binding.tilPhone.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                checkAllFields()
            }
        })

        binding.tilPassword.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                checkAllFields()
            }
        })

        binding.tilConfirmPassword.editText?.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                checkAllFields()
            }
        })

        // Get the user category passed from the previous activity
        val userCategory = intent.getStringExtra("USER_CATEGORY")
        Toast.makeText(this, "User category: $userCategory", Toast.LENGTH_LONG).show()

        when (userCategory) {
            "Support Organization" -> {
                binding.tvDescription.visibility = View.VISIBLE
                binding.tvDescription1.visibility = View.GONE
            }

            "Reporter/Requester" -> { // Note: Your screenshot shows "Reporter/Requester", not "Support Individual"
                binding.tvDescription.visibility = View.GONE
                binding.tvDescription1.visibility = View.VISIBLE
            }

            else -> {
                // Hide both descriptions for any other case or when the category is null
                binding.tvDescription.visibility = View.GONE
                binding.tvDescription1.visibility = View.GONE
            }
        }

        // Add a click listener for the "Sign in" text
        binding.txSignIn.setOnClickListener {
            // Create an Intent to start the LoginActivity
            val intent = Intent(this, LoginActivity::class.java)
            // Start the new activity
            startActivity(intent)
        }

        // Set up button click listener
        binding.btnSignUp.setOnClickListener {
            val isOrganization = userCategory == "Support Organization"
            viewModel.onSignupClicked(isOrganization)
        }

        // Collect UI state changes from the ViewModel
        lifecycleScope.launch {
            viewModel.uiState.collect { state ->
                when (state) {
                    is SignupUiState.Idle -> { /* Do nothing */ }
                    is SignupUiState.Loading -> {
                        // Show a loading indicator
                        binding.btnSignUp.isEnabled = false
                        Toast.makeText(this@SignupActivity, "Signing up...", Toast.LENGTH_SHORT).show()
                    }
                    is SignupUiState.Success -> {
                        // Handle successful signup
                        binding.btnSignUp.isEnabled = true
                        Toast.makeText(this@SignupActivity, state.message, Toast.LENGTH_LONG).show()
                        // Navigate to the next screen
                    }
                    is SignupUiState.Error -> {
                        // Handle signup error
                        binding.btnSignUp.isEnabled = true
                        Toast.makeText(this@SignupActivity, state.message, Toast.LENGTH_LONG).show()
                    }
                }
            }
        }
    }
    private fun checkAllFields() {
        val isFullNameValid = !binding.tilFullName.editText?.text.isNullOrBlank()
        val isEmailValid = !binding.tilEmail.editText?.text.isNullOrBlank()
        val isPhoneValid = !binding.tilPhone.editText?.text.isNullOrBlank()
        val isPasswordValid = !binding.tilPassword.editText?.text.isNullOrBlank()
        val isConfirmPasswordValid = !binding.tilConfirmPassword.editText?.text.isNullOrBlank()

        val passwordsMatch = binding.tilPassword.editText?.text.toString() ==
                binding.tilConfirmPassword.editText?.text.toString()

        val isFormValid = isFullNameValid && isEmailValid && isPhoneValid && isPasswordValid
                 && isConfirmPasswordValid && passwordsMatch

        // Enable the button only if all fields are valid
        binding.btnSignUp.isEnabled = isFormValid
    }
}
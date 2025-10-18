package com.example.broach.features.login.ui

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.example.broach.R
import com.example.broach.databinding.ActivityLoginBinding
import com.example.broach.features.home.ui.DetailsActivity
import com.example.broach.features.home.ui.HomeActivity
import com.example.broach.features.login.data.LoginRepository
import com.example.broach.features.signup.ui.SignupActivity
import com.example.broach.network.ApiService
import com.example.broach.network.RetrofitClient
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var loadingDialog: Dialog

    private val loginViewModel: LoginViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                if (modelClass.isAssignableFrom(LoginViewModel::class.java)) {
                    val apiService = RetrofitClient.createService(ApiService::class.java)
                    val repository = LoginRepository(apiService)
                    @Suppress("UNCHECKED_CAST")
                    return LoginViewModel(repository) as T
                }
                throw IllegalArgumentException("Unknown ViewModel class")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize the custom loading dialog
        setupLoadingDialog()

        // Set up listeners for the login button and text fields.
        setupListeners()
        // Observe the login result from the ViewModel.
        observeLoginUiState()

        binding.tvSignUp?.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            startActivity(intent)
        }
    }

    private fun setupListeners() {
        binding.btnLogin?.setOnClickListener {
            val username = binding.tilEmail?.editText?.text.toString()
            val password = binding.tilPassword?.editText?.text.toString()
            loginViewModel.login(username, password)
        }
        binding.tilPassword?.editText?.addTextChangedListener(createWatcher {
            binding.tilPassword?.error = null
        })
        binding.tilEmail?.editText?.addTextChangedListener(createWatcher {
            binding.tilEmail?.error = null
        })
        binding.tvForgotPassword?.setOnClickListener {
            // Hide the login UI and show the fragment container
            binding.loginLayout?.visibility = View.GONE
            binding.fragmentContainer?.visibility = View.VISIBLE

            supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, ForgotPasswordFragment())
                .addToBackStack(null)
                .commit()
        }
    }

    private fun observeLoginUiState() {
        lifecycleScope.launch {
            loginViewModel.uiState.collect { state ->
                when (state) {
                    is LoginUiState.Idle -> { /* Do nothing */ }
                    is LoginUiState.Loading -> {
                        binding.btnLogin?.isEnabled = false
                        showLoadingDialog()
                    }
                    is LoginUiState.Success -> {
                        binding.btnLogin?.isEnabled = true
                        hideLoadingDialog()
                        if (state.isDetailsSubmitted) {
                            navigateToHomePage(state.userType)
                        } else {
                            navigateToDetailsPage(state.userType)
                        }
                    }
                    is LoginUiState.Error -> {
                        binding.btnLogin?.isEnabled = true
                        hideLoadingDialog()
                        showLoginFailed(state.message)
                    }
                }
            }
        }
    }

    private fun navigateToDetailsPage(userRole: String) {
        val intent = Intent(this, DetailsActivity::class.java).apply {
            putExtra("USER_ROLE", userRole)
        }
        startActivity(intent)
        finish()
    }

    private fun navigateToHomePage(userRole: String) {
        val intent = Intent(this, HomeActivity::class.java).apply {
            putExtra("USER_ROLE", userRole)
        }
        startActivity(intent)
        finish()
    }

    private fun setupLoadingDialog() {
        loadingDialog = Dialog(this)
        loadingDialog.setContentView(LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(50, 50, 50, 50)
            addView(ProgressBar(context))
            addView(TextView(context).apply {
                text = context.getString(R.string.logging_in)
                textSize = 18f
                setPadding(20, 0, 0, 0)
            })
        })
        loadingDialog.window?.setBackgroundDrawableResource(android.R.color.transparent)
        loadingDialog.setCancelable(false)
        loadingDialog.setCanceledOnTouchOutside(false)
    }

    private fun showLoadingDialog() {
        if (!loadingDialog.isShowing) {
            loadingDialog.show()
        }
    }

    private fun hideLoadingDialog() {
        if (loadingDialog.isShowing) {
            loadingDialog.dismiss()
        }
    }

    private fun showLoginFailed(message: String) {
        Toast.makeText(applicationContext, "Login failed: $message", Toast.LENGTH_SHORT).show()
    }

    private fun createWatcher(onTextChanged: (String) -> Unit): TextWatcher {
        return object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                onTextChanged(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        }
    }
}
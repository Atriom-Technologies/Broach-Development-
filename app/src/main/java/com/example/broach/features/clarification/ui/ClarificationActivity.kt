package com.example.broach.features.clarification.ui

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.broach.R
import com.example.broach.databinding.ActivityClarificationPageBinding
import com.example.broach.features.signup.ui.SignupActivity

class ClarificationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityClarificationPageBinding
    private var selectedCategory: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityClarificationPageBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up the dropdown menu with the user categories
        val categories = arrayOf("Reporter/Requester", "Support Organization")
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, categories)
        binding.categoryDropdown.setAdapter(adapter)

        // Listen for item selection in the dropdown
        binding.categoryDropdown.setOnItemClickListener { parent, view, position, id ->
            selectedCategory = parent.getItemAtPosition(position).toString()
        }

        // Handle the continue button click
        binding.continueButton.setOnClickListener {
            if (selectedCategory != null) {
                // Pass the selected category to the next activity
                val intent = Intent(this, SignupActivity::class.java).apply {
                    putExtra("USER_CATEGORY", selectedCategory)
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "Please select a category.", Toast.LENGTH_SHORT).show()
            }
        }

        // Show the user categories popup when the help text is clicked
        binding.tvHelpText1.setOnClickListener {
            showUserCategoriesPopup()
        }
    }

    private fun showUserCategoriesPopup() {
        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        val popupView = inflater.inflate(R.layout.popup_user_categories, null)

        val popupWindow = PopupWindow(
            popupView,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            true
        )

        popupWindow.showAsDropDown(binding.tvHelpText1)
    }
}
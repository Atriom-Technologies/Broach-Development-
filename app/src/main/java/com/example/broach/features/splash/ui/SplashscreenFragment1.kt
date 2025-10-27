package com.example.broach.features.splash.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.broach.databinding.FragmentSplashscreen1Binding

class SplashscreenFragment1 : Fragment() {

    private var _binding: FragmentSplashscreen1Binding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSplashscreen1Binding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnNext.setOnClickListener {
            (activity as? Splashscreen)?.next()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
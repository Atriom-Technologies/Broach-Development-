package com.example.broach.features.splash.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.broach.databinding.FragmentSplashscreen3Binding

class SplashscreenFragment3 : Fragment() {

    private var _binding: FragmentSplashscreen3Binding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSplashscreen3Binding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.btnContinue.setOnClickListener {
            (activity as? Splashscreen)?.next()
        }

        binding.btnBack.setOnClickListener {
            (activity as? Splashscreen)?.previous()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
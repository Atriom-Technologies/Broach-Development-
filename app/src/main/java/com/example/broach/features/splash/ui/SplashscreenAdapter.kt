package com.example.broach.features.splash.ui

import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.viewpager2.adapter.FragmentStateAdapter

class SplashscreenAdapter(activity: AppCompatActivity) : FragmentStateAdapter(activity) {

    override fun getItemCount(): Int = 3

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> SplashscreenFragment1()
            1 -> SplashscreenFragment2()
            2 -> SplashscreenFragment3()
            else -> throw IllegalStateException("Invalid position")
        }
    }
}
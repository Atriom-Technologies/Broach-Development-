package com.example.broach.features.profile.ui

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter

class ProfileViewPagerAdapter(fragmentActivity: FragmentActivity) : FragmentStateAdapter(fragmentActivity) {

    override fun getItemCount(): Int = 3

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> CaseListFragment.newInstance("Reports/Services")
            1 -> CaseListFragment.newInstance("Resolved")
            2 -> CaseListFragment.newInstance("Pending")
            else -> throw IllegalStateException("Invalid position")
        }
    }
}
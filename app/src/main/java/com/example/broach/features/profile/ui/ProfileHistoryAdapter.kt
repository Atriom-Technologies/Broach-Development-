package com.example.broach.features.profile.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.broach.databinding.ItemProfileHistoryBinding
import com.example.broach.features.profile.data.ProfileHistoryItem

class ProfileHistoryAdapter(private val historyItems: List<ProfileHistoryItem>) : RecyclerView.Adapter<ProfileHistoryAdapter.HistoryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemProfileHistoryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        holder.bind(historyItems[position])
    }

    override fun getItemCount() = historyItems.size

    class HistoryViewHolder(private val binding: ItemProfileHistoryBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ProfileHistoryItem) {
            binding.tvOrganizationName.text = item.organizationName
            binding.tvCaseType.text = item.caseType
            binding.tvDate.text = item.date
            // Load image with Glide or Picasso if you have a URL in your data model
            // Glide.with(itemView.context).load(item.organizationLogoUrl).into(binding.ivOrganizationLogo)
        }
    }
}
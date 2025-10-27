package com.example.broach.features.profile.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.broach.databinding.ItemOrganizationProfileHistoryBinding
import com.example.broach.features.profile.data.OrganizationProfileHistoryItem

class OrganizationProfileHistoryAdapter(private val historyItems: List<OrganizationProfileHistoryItem>) : RecyclerView.Adapter<OrganizationProfileHistoryAdapter.HistoryViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HistoryViewHolder {
        val binding = ItemOrganizationProfileHistoryBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return HistoryViewHolder(binding)
    }

    override fun onBindViewHolder(holder: HistoryViewHolder, position: Int) {
        holder.bind(historyItems[position])
    }

    override fun getItemCount() = historyItems.size

    class HistoryViewHolder(private val binding: ItemOrganizationProfileHistoryBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: OrganizationProfileHistoryItem) {
            binding.tvRequesterName.text = item.requesterName
            binding.tvCaseType.text = item.caseType
            binding.tvDate.text = item.date
            // Load image with Glide or Picasso if you have a URL in your data model
            // Glide.with(itemView.context).load(item.requesterImageUrl).into(binding.ivRequesterImage)
        }
    }
}
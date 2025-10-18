package com.example.broach.features.home.ui.data

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.broach.databinding.ItemCaseHistoryOrganizationBinding
import com.example.broach.databinding.ItemServiceHistoryOrganizationBinding

class OrganizationHistoryAdapter(
    private val historyItems: List<OrganizationHistoryItem>
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private const val TYPE_CASE = 1
        private const val TYPE_SERVICE = 2
    }

    override fun getItemViewType(position: Int): Int {
        return if (historyItems[position].isCase) TYPE_CASE else TYPE_SERVICE
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return when (viewType) {
            TYPE_CASE -> {
                val binding = ItemCaseHistoryOrganizationBinding.inflate(inflater, parent, false)
                CaseViewHolder(binding)
            }
            TYPE_SERVICE -> {
                val binding = ItemServiceHistoryOrganizationBinding.inflate(inflater, parent, false)
                ServiceViewHolder(binding)
            }
            else -> throw IllegalArgumentException("Invalid view type")
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = historyItems[position]
        when (holder) {
            is CaseViewHolder -> holder.bind(item)
            is ServiceViewHolder -> holder.bind(item)
        }
    }

    override fun getItemCount() = historyItems.size

    inner class CaseViewHolder(private val binding: ItemCaseHistoryOrganizationBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: OrganizationHistoryItem) {
            binding.tvDate.text = item.date
            binding.tvTime.text = item.time
            binding.tvReqName.text = item.name
            binding.tvReqType.text = item.description
        }
    }

    inner class ServiceViewHolder(private val binding: ItemServiceHistoryOrganizationBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: OrganizationHistoryItem) {
            binding.tvDate.text = item.date
            binding.tvTime.text = item.time
            binding.tvOrgName.text = item.name
            binding.tvServiceType.text = item.description
        }
    }
}

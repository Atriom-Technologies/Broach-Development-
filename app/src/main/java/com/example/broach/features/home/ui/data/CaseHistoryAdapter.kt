package com.example.broach.features.home.ui.data

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.broach.databinding.ItemCaseHistoryRequesterBinding
import com.example.broach.databinding.ItemServiceHistoryRequesterBinding

class CaseHistoryAdapter(
    private val historyItems: List<CaseHistoryItem>
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
        return if (viewType == TYPE_CASE) {
            val binding = ItemCaseHistoryRequesterBinding.inflate(inflater, parent, false)
            CaseViewHolder(binding)
        } else {
            val binding = ItemServiceHistoryRequesterBinding.inflate(inflater, parent, false)
            ServiceViewHolder(binding)
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = historyItems[position]
        if (holder is CaseViewHolder) {
            holder.bind(item)
        } else if (holder is ServiceViewHolder) {
            holder.bind(item)
        }
    }

    override fun getItemCount() = historyItems.size

    inner class CaseViewHolder(private val binding: ItemCaseHistoryRequesterBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: CaseHistoryItem) {
            binding.tvDate.text = item.date
            binding.tvTime.text = item.time
            binding.tvOrgName.text = item.organization
            binding.tvCaseType.text = item.description
        }
    }

    inner class ServiceViewHolder(private val binding: ItemServiceHistoryRequesterBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: CaseHistoryItem) {
            binding.tvDate.text = item.date
            binding.tvTime.text = item.time
            binding.tvOrgName.text = item.organization
            binding.tvServiceType.text = item.description
        }
    }
}

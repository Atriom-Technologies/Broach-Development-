package com.example.broach.features.notifications.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.databinding.ItemCaseNotificationBinding
import com.example.broach.databinding.ItemServiceNotificationBinding
import com.example.broach.features.notifications.data.Notification
import com.example.broach.features.notifications.data.NotificationType

class NotificationAdapter(private val notifications: List<Notification>) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    companion object {
        private const val TYPE_CASE = 0
        private const val TYPE_SERVICE = 1
    }

    override fun getItemViewType(position: Int): Int {
        return when (notifications[position].type) {
            NotificationType.CASE -> TYPE_CASE
            NotificationType.SERVICE -> TYPE_SERVICE
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        return when (viewType) {
            TYPE_CASE -> {
                val binding = ItemCaseNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
                CaseNotificationViewHolder(binding)
            }
            else -> {
                val binding = ItemServiceNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
                ServiceNotificationViewHolder(binding)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (holder.itemViewType) {
            TYPE_CASE -> (holder as CaseNotificationViewHolder).bind(notifications[position])
            TYPE_SERVICE -> (holder as ServiceNotificationViewHolder).bind(notifications[position])
        }
    }

    override fun getItemCount() = notifications.size

    inner class CaseNotificationViewHolder(private val binding: ItemCaseNotificationBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(notification: Notification) {
            binding.tvNotificationDate.text = notification.date
            binding.tvNotificationTitle.text = notification.title
            binding.tvOrganizationName.text = notification.organizationName
            binding.tvNotificationCategory.text = notification.category

            Glide.with(itemView.context)
                .load(notification.organizationLogoUrl)
                .placeholder(R.drawable.ic_launcher_background) // A default placeholder
                .into(binding.ivOrganizationLogo)

            // Reset all visibilities
            binding.groupPendingButtons.visibility = View.GONE
            binding.groupInDiscButtons.visibility = View.GONE
            binding.groupClosedView.visibility = View.GONE

            // Set status text and color, and show correct buttons
            when (notification.status) {
                NotificationStatus.PENDING -> {
                    binding.tvNotificationStatus.text = "PENDING"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.yellow)) // Define this color
                    binding.groupPendingButtons.visibility = View.VISIBLE
                }
                NotificationStatus.IN_DISCUSSION -> {
                    binding.tvNotificationStatus.text = "IN DISC."
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.green)) // Define this color
                    binding.groupInDiscButtons.visibility = View.VISIBLE
                }
                NotificationStatus.CLOSED -> {
                    binding.tvNotificationStatus.text = "CLOSED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.red)) // Define this color
                    binding.groupClosedView.visibility = View.VISIBLE
                    notification.removalTime?.let {
                        binding.tvRemovalTimer.text = it
                        binding.tvRemovalTimer.visibility = View.VISIBLE
                    } ?: run {
                        binding.tvRemovalTimer.visibility = View.GONE
                    }
                }
            }
        }
    }

    inner class ServiceNotificationViewHolder(private val binding: ItemServiceNotificationBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(notification: Notification) {
            binding.tvNotificationDate.text = notification.date
            binding.tvNotificationTitle.text = notification.title
            binding.tvOrganizationName.text = notification.organizationName
            binding.tvNotificationCategory.text = notification.category

            Glide.with(itemView.context)
                .load(notification.organizationLogoUrl)
                .placeholder(R.drawable.ic_launcher_background) // A default placeholder
                .into(binding.ivOrganizationLogo)

            // Reset all visibilities
            binding.groupPendingButtons.visibility = View.GONE
            binding.groupInDiscButtons.visibility = View.GONE
            binding.groupClosedView.visibility = View.GONE

            // Set status text and color, and show correct buttons
            when (notification.status) {
                NotificationStatus.PENDING -> {
                    binding.tvNotificationStatus.text = "PENDING"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.yellow)) // Define this color
                    binding.groupPendingButtons.visibility = View.VISIBLE
                }
                NotificationStatus.IN_DISCUSSION -> {
                    binding.tvNotificationStatus.text = "IN DISC."
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.green)) // Define this color
                    binding.groupInDiscButtons.visibility = View.VISIBLE
                }
                NotificationStatus.CLOSED -> {
                    binding.tvNotificationStatus.text = "CLOSED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.red)) // Define this color
                    binding.groupClosedView.visibility = View.VISIBLE
                    notification.removalTime?.let {
                        binding.tvRemovalTimer.text = it
                        binding.tvRemovalTimer.visibility = View.VISIBLE
                    } ?: run {
                        binding.tvRemovalTimer.visibility = View.GONE
                    }
                }
            }
        }
    }
}

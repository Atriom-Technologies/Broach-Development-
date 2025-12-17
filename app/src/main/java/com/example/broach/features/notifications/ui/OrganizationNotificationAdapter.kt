package com.example.broach.features.notifications.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.broach.R
import com.example.broach.databinding.ItemCaseOrganizationNotificationBinding
import com.example.broach.databinding.ItemServiceOrganizationNotificationBinding
import com.example.broach.features.notifications.data.NotificationType
import com.example.broach.features.notifications.data.OrganizationNotification

class OrganizationNotificationAdapter(private val notifications: List<OrganizationNotification>) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

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
                val binding = ItemCaseOrganizationNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
                CaseViewHolder(binding)
            }
            else -> {
                val binding = ItemServiceOrganizationNotificationBinding.inflate(LayoutInflater.from(parent.context), parent, false)
                ServiceViewHolder(binding)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        when (holder.itemViewType) {
            TYPE_CASE -> (holder as CaseViewHolder).bind(notifications[position])
            TYPE_SERVICE -> (holder as ServiceViewHolder).bind(notifications[position])
        }
    }

    override fun getItemCount() = notifications.size

    inner class CaseViewHolder(private val binding: ItemCaseOrganizationNotificationBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(notification: OrganizationNotification) {
            binding.tvNotificationDate.text = notification.date
            binding.tvNotificationTitle.text = notification.title
            binding.tvUserName.text = notification.userName
            binding.tvNotificationCategory.text = notification.category

            Glide.with(itemView.context)
                .load(notification.userProfileImageUrl)
                .placeholder(R.drawable.ic_person)
                .into(binding.ivUserProfileImage)

            binding.groupNewButtons.visibility = View.GONE
            binding.groupViewedButtons.visibility = View.GONE
            binding.tvClosedMessage.visibility = View.GONE

            when (notification.status) {
                OrganizationNotificationStatus.NEW -> {
                    binding.tvNotificationStatus.text = "NEW"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.green))
                    binding.groupNewButtons.visibility = View.VISIBLE
                }
                OrganizationNotificationStatus.VIEWED -> {
                    binding.tvNotificationStatus.text = "VIEWED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.yellow))
                    binding.groupViewedButtons.visibility = View.VISIBLE
                }
                OrganizationNotificationStatus.CLOSED -> {
                    binding.tvNotificationStatus.text = "CLOSED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.red))
                    binding.tvClosedMessage.visibility = View.VISIBLE
                }
            }
        }
    }

    inner class ServiceViewHolder(private val binding: ItemServiceOrganizationNotificationBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(notification: OrganizationNotification) {
            binding.tvNotificationDate.text = notification.date
            binding.tvNotificationTitle.text = notification.title
            binding.tvUserName.text = notification.userName
            binding.tvNotificationCategory.text = notification.category

            Glide.with(itemView.context)
                .load(notification.userProfileImageUrl)
                .placeholder(R.drawable.ic_person)
                .into(binding.ivUserProfileImage)

            binding.groupNewButtons.visibility = View.GONE
            binding.groupViewedButtons.visibility = View.GONE
            binding.tvClosedMessage.visibility = View.GONE

            when (notification.status) {
                OrganizationNotificationStatus.NEW -> {
                    binding.tvNotificationStatus.text = "NEW"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.green))
                    binding.groupNewButtons.visibility = View.VISIBLE
                }
                OrganizationNotificationStatus.VIEWED -> {
                    binding.tvNotificationStatus.text = "VIEWED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.yellow))
                    binding.groupViewedButtons.visibility = View.VISIBLE
                }
                OrganizationNotificationStatus.CLOSED -> {
                    binding.tvNotificationStatus.text = "CLOSED"
                    binding.tvNotificationStatus.setTextColor(ContextCompat.getColor(itemView.context, R.color.red))
                    binding.tvClosedMessage.visibility = View.VISIBLE
                }
            }
        }
    }
}

package com.example.broach.features.profile.ui

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.broach.databinding.FragmentCoverPhotoOptionsBinding
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class CoverPhotoOptionsFragment : BottomSheetDialogFragment() {

    private var _binding: FragmentCoverPhotoOptionsBinding? = null
    private val binding get() = _binding!!

    private var listener: CoverPhotoOptionListener? = null

    interface CoverPhotoOptionListener {
        fun onViewCoverClicked()
        fun onUploadPhotoClicked()
        fun onRepositionCoverClicked()
        fun onRemoveCoverClicked()
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        listener = context as? CoverPhotoOptionListener
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCoverPhotoOptionsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvViewCover.setOnClickListener {
            listener?.onViewCoverClicked()
            dismiss()
        }
        binding.tvUploadPhoto.setOnClickListener {
            listener?.onUploadPhotoClicked()
            dismiss()
        }
        binding.tvRepositionCover.setOnClickListener {
            listener?.onRepositionCoverClicked()
            dismiss()
        }
        binding.tvRemoveCover.setOnClickListener {
            listener?.onRemoveCoverClicked()
            dismiss()
        }
        binding.btnClose.setOnClickListener {
            dismiss()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    override fun onDetach() {
        super.onDetach()
        listener = null
    }
}
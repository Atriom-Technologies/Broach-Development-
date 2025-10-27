package com.example.broach.features.profile.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.broach.databinding.FragmentCaseListBinding

class CaseListFragment : Fragment() {

    private var _binding: FragmentCaseListBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCaseListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.rvCases.layoutManager = LinearLayoutManager(context)
        // Later, you will set the adapter here.

        // For now, always show the empty message
        binding.tvEmptyMessage.visibility = View.VISIBLE
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val ARG_CASE_TYPE = "case_type"

        fun newInstance(caseType: String): CaseListFragment {
            val fragment = CaseListFragment()
            val args = Bundle()
            args.putString(ARG_CASE_TYPE, caseType)
            fragment.arguments = args
            return fragment
        }
    }
}
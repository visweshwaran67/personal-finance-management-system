package com.vichu.personal_finance.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.vichu.personal_finance.dto.ExpenseRequest;
import com.vichu.personal_finance.dto.ExpenseResponse;
import com.vichu.personal_finance.entity.Expense;
import com.vichu.personal_finance.exception.ResourceNotFoundException;
import com.vichu.personal_finance.repository.ExpenseRepository;
import com.vichu.personal_finance.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import com.vichu.personal_finance.entity.User;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;


    public ExpenseService(ExpenseRepository expenseRepository ,UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public ExpenseResponse createExpense(ExpenseRequest expenseRequest) {

        Expense expense = new Expense();

        expense.setAmount(expenseRequest.getAmount());
        expense.setDate(expenseRequest.getDate());
        expense.setDescription(expenseRequest.getDescription());

        String username = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

        User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));

        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        ExpenseResponse response = new ExpenseResponse();
        response.setId(savedExpense.getId());
        response.setAmount(savedExpense.getAmount());
        response.setDate(savedExpense.getDate());
        response.setDescription(savedExpense.getDescription());
        return response;
    }

   public List<ExpenseResponse> getAllExpenses() {

    String username = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

        List<Expense> expenses =
        expenseRepository.findByUser_Username(username);

    List<ExpenseResponse> responses = new ArrayList<>();

    for (Expense expense : expenses) {

        ExpenseResponse response = new ExpenseResponse();

        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setDate(expense.getDate());
        response.setDescription(expense.getDescription());

        responses.add(response);
    }

    return responses;
}

    public ExpenseResponse getExpenseById(Long id) {

        String username = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

      Expense expense = expenseRepository
        .findByIdAndUser_Username(id, username)
        .orElseThrow(() -> new ResourceNotFoundException(
                "Expense not found with id : " + id));

        ExpenseResponse response = new ExpenseResponse();

        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setDate(expense.getDate());
        response.setDescription(expense.getDescription());

        return response;
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest expenseRequest) {

        String username = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

Expense existing = expenseRepository
        .findByIdAndUser_Username(id, username)
        .orElseThrow(() -> new ResourceNotFoundException(
                "Expense not found with id : " + id));

        existing.setAmount(expenseRequest.getAmount());
        existing.setDate(expenseRequest.getDate());
        existing.setDescription(expenseRequest.getDescription());

        Expense updatedExpense = expenseRepository.save(existing);
        ExpenseResponse response = new ExpenseResponse();

        response.setId(updatedExpense.getId());
        response.setAmount(updatedExpense.getAmount());
        response.setDate(updatedExpense.getDate());
        response.setDescription(updatedExpense.getDescription());
        return response;
    }

   public void deleteExpense(Long id) {

    String username = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();

    Expense expense = expenseRepository
            .findByIdAndUser_Username(id, username)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Expense not found with id : " + id));

    expenseRepository.delete(expense);
}
}
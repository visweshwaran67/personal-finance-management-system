package com.vichu.personal_finance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vichu.personal_finance.entity.Expense;
import java.util.List;
import java.util.Optional;

public interface  ExpenseRepository extends JpaRepository<Expense, Long>{
       List<Expense> findByUser_Username(String username);
       Optional<Expense> findByIdAndUser_Username(Long id, String username);

}

using Microsoft.EntityFrameworkCore;
using BasicProject.Data.Entities;

namespace BasicProject.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Quiz> Quizzes { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<QuestionOption> QuestionOptions { get; set; } = null!;
    public DbSet<Attempt> Attempts { get; set; } = null!;
    public DbSet<AttemptAnswer> AttemptAnswers { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(eb =>
        {
            eb.HasKey(u => u.Id);
            eb.Property(u => u.Name).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Quiz>(eb =>
        {
            eb.HasKey(q => q.Id);
            eb.Property(q => q.Title).HasMaxLength(200).IsRequired();
            eb.HasOne(q => q.Author).WithMany(u => u.Quizzes).HasForeignKey(q => q.AuthorId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Question>(eb =>
        {
            eb.HasKey(q => q.Id);
            eb.Property(q => q.Text).HasMaxLength(500).IsRequired();
            eb.HasOne(q => q.Quiz).WithMany(qz => qz.Questions).HasForeignKey(q => q.QuizId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionOption>(eb =>
        {
            eb.HasKey(o => o.Id);
            eb.Property(o => o.Text).HasMaxLength(300).IsRequired();
            eb.HasOne(o => o.Question).WithMany(q => q.Options).HasForeignKey(o => o.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Attempt>(eb =>
        {
            eb.HasKey(a => a.Id);
            eb.HasOne(a => a.Quiz).WithMany(q => q.Attempts).HasForeignKey(a => a.QuizId).OnDelete(DeleteBehavior.Cascade);
            eb.HasOne(a => a.User).WithMany(u => u.Attempts).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AttemptAnswer>(eb =>
        {
            eb.HasKey(aa => aa.Id);
            eb.HasOne(aa => aa.Attempt).WithMany(a => a.Answers).HasForeignKey(aa => aa.AttemptId).OnDelete(DeleteBehavior.Cascade);
            eb.HasOne(aa => aa.Question).WithMany(q => q.AttemptAnswers).HasForeignKey(aa => aa.QuestionId).OnDelete(DeleteBehavior.Restrict);
            eb.HasOne(aa => aa.SelectedOption).WithMany(o => o.AttemptAnswers).HasForeignKey(aa => aa.SelectedOptionId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}

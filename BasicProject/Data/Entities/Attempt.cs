using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class Attempt
    {
        public int Id { get; set; }

        public int QuizId { get; set; }
        public Quiz? Quiz { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int Score { get; set; }
        public int TotalQuestions { get; set; } // Denormalized for convenience

        public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
    }
}

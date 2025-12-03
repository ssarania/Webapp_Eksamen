using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class Question
    {
        public int Id { get; set; }

        [Required]
        [StringLength(500)]
        public string Text { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? Explanation { get; set; }

        public int QuizId { get; set; }
        public Quiz? Quiz { get; set; }

        public int Order { get; set; } // To maintain question order in quiz

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();
    }
}

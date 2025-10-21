using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class QuestionOption
    {
        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string Text { get; set; } = string.Empty;

        public bool IsCorrect { get; set; }

        public int QuestionId { get; set; }
        public Question? Question { get; set; }

        public ICollection<AttemptAnswer> AttemptAnswers { get; set; } = new List<AttemptAnswer>();
    }
}

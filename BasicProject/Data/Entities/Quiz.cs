using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class Quiz
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public int QuestionCount { get; set; }

        public int AuthorId { get; set; }
        public User? Author { get; set; }

        public bool IsPublic { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}

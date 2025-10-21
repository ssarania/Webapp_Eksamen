using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}

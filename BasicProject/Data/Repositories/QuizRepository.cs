using BasicProject.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BasicProject.Data.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Quiz>> GetByAuthorAsync(int authorId)
        {
            return await _dbSet.Where(q => q.AuthorId == authorId).ToListAsync();
        }
        
        // Synchronous CRUD members required by IQuizRepository
        public Quiz Create(Quiz quiz)
        {
            _dbSet.Add(quiz);
            return quiz;
        }

        public Quiz? Get(int id)
        {
            return _dbSet.Find(id);
        }

        public Quiz Update(Quiz quiz)
        {
            _dbSet.Update(quiz);
            return quiz;
        }

        public bool Delete(int id)
        {
            var existing = _dbSet.Find(id);
            if (existing == null) return false;
            _dbSet.Remove(existing);
            return true;
        }
    }
}

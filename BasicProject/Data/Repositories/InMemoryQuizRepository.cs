using System.Net.Http.Headers;
using BasicProject.Data.Entities;
using BasicProject.Data.Repositories;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Npgsql.Internal;
using System.Linq.Expressions;
using BasicProject.Data.Entities;

namespace BasicProject.Data.Repositories
{
    public class InMemoryQuizRepository : IQuizRepository
    {
        private readonly Dictionary<int, Quiz> _db = new();
        private int _idCounter = 1;

        public Quiz Create(Quiz quiz)
        {
            if (string.IsNullOrWhiteSpace(quiz.Title))
                throw new ArgumentException("Quiz must have a title");

            quiz.Id = _idCounter++;
            _db[quiz.Id] = quiz;
            return quiz;
        }

        public Quiz? Get(int id)
        {
            _db.TryGetValue(id, out var quiz);
            return quiz;
        }

        public Quiz Update(Quiz quiz)
        {
            if (!_db.ContainsKey(quiz.Id))
                throw new KeyNotFoundException("Quiz does not exist");

            _db[quiz.Id] = quiz;
            return quiz;
        }

        public bool Delete(int id)
        {
            return _db.Remove(id);
        }

        public Task<IEnumerable<Quiz>> GetByAuthorAsync(long authorId)
        {
            var list = _db.Values.Where(q => q.AuthorId == authorId).AsEnumerable();
            return Task.FromResult(list);
        }

        // Implementation of IRepository<Quiz> members
        public Task<Quiz?> GetByIdAsync(long id)
        {
            // underlying in-memory store uses int keys for quiz ids
            var intId = (int)id;
            return Task.FromResult(Get(intId));
        }

        public Task<IEnumerable<Quiz>> GetAllAsync()
        {
            return Task.FromResult(_db.Values.AsEnumerable());
        }

        public Task AddAsync(Quiz entity)
        {
            Create(entity);
            return Task.CompletedTask;
        }

        // Explicit implementation to avoid signature conflict with the IQuizRepository.Update method
        void IRepository<Quiz>.Update(Quiz entity)
        {
            Update(entity);
        }

        public void Remove(Quiz entity)
        {
            _db.Remove(entity.Id);
        }

        public Task<IEnumerable<Quiz>> FindAsync(Expression<Func<Quiz, bool>> predicate)
        {
            var compiled = predicate.Compile();
            var result = _db.Values.Where(compiled).AsEnumerable();
            return Task.FromResult(result);
        }
    }
}
